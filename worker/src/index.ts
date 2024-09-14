//@ts-nocheck
import { Kafka } from 'kafkajs';
import express from 'express';
import { sendEmail } from './sendemail';
import { addUser, testConnection } from './updatedb';
require('dotenv').config();
const axios = require('axios');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const port = 3004;
app.use(express.json());


const TOPIC_NAME = "zapout"

const kafka = new Kafka({
  clientId: 'outbox-processor-2',
  brokers: ['localhost:9092']
})

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker-2" });
  await consumer.connect();
  const producer = kafka.producer();
  await producer.connect();
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString()
      })
      if (!message.value?.toString()) {
        return;
      }
      const parsedValue = JSON.parse(message.value?.toString())
      const zaprunid = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      const zapRunDetails = await prisma.zapRun.findFirst({
        where: {
          id: zaprunid
        },
        include: {
          zap: {
            include: {
              actions: {
                include: {
                  type: true
                }
              }
            }
          }
        }
      });

      const currentAction = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);

      if (!currentAction) {
        console.log("Current action not found?");
        return;
      }

      if (currentAction?.type?.id === 'action_6') {
        const dbUrl = currentAction.metadata.dbUrl;
        const dbName = currentAction.metadata.dbName;
        const username = currentAction.metadata.username;
        const password = currentAction.metadata.password;

        const newUser = {
          name: 'usersuccess',
          email: 'success@example.com',
          password: 'Test@1234'
        };

        const dbConfig = {
          dbUrl: dbUrl,
          dbName: dbName,
          username: username,
          password: password
        };

        try {
          const result = await addUser(newUser, dbConfig);

          if (result.error) {
            console.log("User not added:", result.error);
          } else {
            console.log("User added:", result);
          }
        } catch (error) {
          console.error("An error occurred while adding the user:", error);
        }
      }


      if (currentAction?.type?.id === 'action_1') {
        const to = currentAction.metadata.email;
        const body = currentAction.metadata.body
        console.log(to, body)
        const res = await sendEmail(to)
        console.log(res);

        // Now you can use dbUrl, dbName, username, and password as needed
      }


      const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1;
      if (lastStage !== stage) {
        console.log("pushing back to the queue");
        await producer.send({
          topic: TOPIC_NAME,
          messages: [{
            value: JSON.stringify({
              stage: stage + 1,
              zapRunId
            })
          }]
        });
      }

      console.log("processing done");
      await consumer.commitOffsets([{
        topic: TOPIC_NAME,
        partition: partition,
        offset: (parseInt(message.offset) + 1).toString()
      }]);



    }
  })
}



app.get('/', (req,res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`worker running at http://localhost:${port}`);
});

main()



