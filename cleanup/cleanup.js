const core = require('@actions/core');
const glob = require('@actions/glob');
const io = require('@actions/io');

async function main() {
  const globber = await glob.create(core.getInput('paths'), {implicitDescendants: false});

  try {
    const paths = await globber.glob();
    for (const path of paths) {
      console.log(`Deleting ${path}`);
      await io.rmRF(path);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main().catch(err => console.log(`Failed to delete files: ${err}`));
