
import React from 'react';
import axios from 'axios';
import getUserInfo from '../../lib/actions/getuserinfo';

const Page = async () => {
    try {
        const userInfo = await getUserInfo();
        const response = await axios.get('http://localhost:3001/getzaps', {
            params: { userId: 1 }
        });

        const zaps = response.data.zaps;
        if (!zaps || zaps.length === 0) {
            return (
                <div className="p-4">
                    <h2 className="text-2xl font-semibold">No Zaps Found</h2>
                    <p>It looks like you haven&apos;t created any zaps yet.</p>
                </div>
            );
        }

        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">User Zaps</h1>
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Zap Name
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {zaps.map((zap: { id: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; actions: any[]; }, index: React.Key | null | undefined) => (
                            <tr key={index} className="border-t">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {zap.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {zap.actions.map(action => action.type.name).join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {zap.actions.map(action => action.type.name).join(', ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    } catch (error) {
        console.error('Error fetching zaps:', error);
        return (
            <div className="p-4">
                <h2 className="text-2xl font-semibold">Error</h2>
                <p>There was an error fetching the zaps. Please try again later.</p>
            </div>
        );
    }
};

export default Page;
