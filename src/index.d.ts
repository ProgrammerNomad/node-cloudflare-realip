declare namespace NodeCloudflareRealIp {
  type Ranges = { v4: string[]; v6: string[] };

  function load(callback?: (err: Error | null, ranges?: Ranges) => void): Promise<Ranges> | void;
  function updateFromCloudflare(): Promise<Ranges>;
  function check(req: any): boolean;
  function get(req: any): string | null;
  function express(): (req: any, res: any, next: any) => void;
  function fastify(): (request: any, reply: any, done: any) => void;
}

export = NodeCloudflareRealIp;
