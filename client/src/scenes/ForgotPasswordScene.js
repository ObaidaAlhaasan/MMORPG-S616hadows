import CredentialsBaseScene from './CredentialsBaseScene';
import { postData } from '../utils/utils';

export default class ForgotPasswordScene extends CredentialsBaseScene {
  constructor() {
    super('ForgotPassword');
  }

  create() {
    this.createUi('Reset Password', this.resetPassword.bind(this), 'Back', this.startScene.bind(this, 'Login'));

    this.passwordInput.parentNode.removeChild(this.passwordInput);
    this.passwordLabel.parentNode.removeChild(this.passwordLabel);
  }

  resetPassword() {
    const loginValue = this.loginInput.value;

    if (loginValue) {
      postData(`${SERVER_URL}/forgot-password`, { email: loginValue })
        .then((response) => {
          console.log(response.message);
          window.alert('If an account was found, a password reset email was sent.');
          this.startScene('Title');
        })
        .catch((error) => {
          console.log(error.message);
          window.alert('If an account was found, a password reset email was sent.');
        });
    } else {
      window.alert('all fields must be filled out');
    }
  }
}
