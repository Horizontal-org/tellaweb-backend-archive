import {Command} from '@oclif/command'

export default class About extends Command {
  static description = 'About direct-upload and Horizontal';

  async run() {
    this.parse(About)
    this.log(
      'Upload server for Tella documentation app for Android. Tella is designed to protect users in repressive environments, it is used by activists, journalists, and civil society groups to document human rights violations, corruption, or electoral fraud. Tella encrypts and hides sensitive material on your device, and quickly deletes it in emergency situations; and groups and organizations can deploy it among their members to collect data for research, advocacy, or legal proceedings.'
    )
  }
}
