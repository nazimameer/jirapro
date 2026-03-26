import connectDB from "@/lib/db";

export default async function TestDBPage() {
  try {
    const conn = await connectDB();
    const isReady = conn.connection.readyState;
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <div className="p-4 bg-green-100 text-green-800 rounded-md">
          Successfully connected to MongoDB! (ReadyState: {isReady})
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <div className="p-4 bg-red-100 text-red-800 rounded-md shadow-sm">
          <h2 className="font-semibold mb-2">Failed to connect</h2>
          <pre className="text-sm whitespace-pre-wrap">{error.message}</pre>
        </div>
      </div>
    );
  }
}
