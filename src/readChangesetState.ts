import { PreState, NewChangeset } from "@changesets/types";
import { readPreState } from "@changesets/pre";
import readChangesets from "@changesets/read";

export type ChangesetState = {
  preState: PreState | undefined;
  changesets: NewChangeset[];
};

export default async function readChangesetState(
  ignoredChangesetProjects: string[] = [],
  cwd: string = process.cwd()
): Promise<ChangesetState> {
  let preState = await readPreState(cwd);
  let isInPreMode = preState !== undefined && preState.mode === "pre";

  let rawChangesets = await readChangesets(cwd);

  let changesets = rawChangesets.filter(changeset =>
    !changeset.releases.some(release => ignoredChangesetProjects.includes(release.name))
  );

  if (isInPreMode) {
    let changesetsToFilter = new Set(preState.changesets);
    changesets = changesets.filter((x) => !changesetsToFilter.has(x.id));
  }

  return {
    preState: isInPreMode ? preState : undefined,
    changesets,
  };
}
