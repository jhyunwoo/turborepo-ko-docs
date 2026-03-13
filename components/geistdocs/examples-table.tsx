import examples from "@/content/examples-data.json";

type ExampleMeta = {
  slug: string;
  name: string;
  description: string;
  template?: string;
  maintainedByCoreTeam: boolean;
};

export function ExamplesTable({
  coreMaintained
}: {
  coreMaintained?: boolean;
}) {
  const rows = (examples as ExampleMeta[]).filter((example) =>
    coreMaintained
      ? example.maintainedByCoreTeam
      : !example.maintainedByCoreTeam
  );

  return (
    <div className="max-w-full overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((example) => (
            <tr key={example.slug}>
              <td>
                <a
                  href={`https://github.com/vercel/turborepo/tree/main/examples/${example.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {example.name}
                </a>
              </td>
              <td>{example.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
