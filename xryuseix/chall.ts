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

function main(reqStr: string) {
  type Request = {
    role: "admin" | "user";
  };
  const req = JSON.parse(reqStr) as Request;
  if (!("role" in req)) {
    return { err: "role is invalid" };
  }
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
