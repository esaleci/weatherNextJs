import { NextApiRequest, NextApiResponse } from 'next';  

export async function GET(req: Request) {  
const ip =  
    req.headers.get('x-forwarded-for') || // For proxy  
    req.headers.get('remote-addr') || // Fall back to remote-addr header for some nodes  
    null;  

return new Response(JSON.stringify({ ip }), {  
    status: 200,  
    headers: {  
        'Content-Type': 'application/json',  
    },  
});  
}  