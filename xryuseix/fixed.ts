import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

type Flag = {
  price: number;
  value: string;
};
type Flags = {
  admin: Flag;
  user: Flag;
};

const flags: Flags = {
  admin: {
    price: 99999,
    value: "ctf4b{3nj0y_th3_b3g1nn3r5_l1v3!!}",
  },
  user: {
    price: 100,
    value: "ctf4b{dummy}",
  },
};

type User = {
  money: number;
  flags: string[];
};

const buyFlag = ({ user, role }: { user: User; role: keyof typeof flags }) => {
  if (user.money < flags[role].price) {
    return { err: "Not enough money" };
  }
  user.money -= flags[role].price;
  user.flags.push(flags[role].value);
  return user;
};

const reqSchema = z
  .object({
    role: z.enum(["admin", "user"]),
  })
  .strict();

function main(reqStr: string) {
  const parseResult = reqSchema.safeParse(JSON.parse(reqStr));
  if (!parseResult.success) {
    return { err: parseResult.error.message };
  }
  const req = parseResult.data; // only { role: "admin" | "user"}
  const user: User = {
    money: 100,
    flags: [],
  };
  return buyFlag({ user: user, ...req });
}

Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const result = main(query.q ?? '{ "role": "user" }');
  return new Response(JSON.stringify(result));
});
