import { flags, SfdxCommand } from '@salesforce/command';

import { terminateOrg } from '../../../api';
import {
  getDefaultOrgInfo,
  logoutFromDefault,
  projectRepoFromOrigin,
} from '../../../common';

export default class Terminate extends SfdxCommand {
  public static description =
    'terminates the default org on Hutte.io and logs out locally';

  protected static requiresProject = true;

  protected static flagsConfig = {
    'api-token': flags.string({
      char: 't',
      description:
        'the api token. Only needed if you have not previously logged in using `sfdx hutte:auth:login`',
    }),
  };

  public async run(): Promise<void> {
    const repoName = await projectRepoFromOrigin();
    const orgInfo = await getDefaultOrgInfo();
    const terminateResponse = await terminateOrg(
      this.flags['api-token'],
      repoName,
      orgInfo.id,
    );

    if (terminateResponse.response.statusCode === 404) {
      console.log(
        'Could not find the scratch org on hutte. Are you sure you are in the correct project?',
      );
      this.exit(1);
    }

    if (Math.floor(terminateResponse.response.statusCode / 100) !== 2) {
      console.log(
        'Request to hutte failed',
        terminateResponse.response.statusCode,
        terminateResponse.body,
      );
      this.exit(1);
    }

    return logoutFromDefault();
  }
}
