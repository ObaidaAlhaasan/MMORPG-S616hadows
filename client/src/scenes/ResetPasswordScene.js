import CredentialsBaseScene from './CredentialsBaseScene';
import {
  postData, createLabel, createInputField, createBrElement, getParam,
} from '../utils/utils';

export default class ResetPasswordScene extends CredentialsBaseScene {
  constructor() {
    super('ResetPassword');
  }

  create() {
    this.createUi('Update Password', this.updatePassword.bind(this), 'Back', this.startScene.bind(this, 'Title'));
    this.createVerifyPasswordInput();
  }

  createVerifyPasswordInput() {
    this.verifyPasswordLabel = createLabel('verifiedPassword', 'Verify Password:', 'form-label');
    this.verifyPasswordInput = createInputField('password', 'verifiedPassword', 'verifiedPassword', 'login-input');

    this.div.append(createBrElement());
    this.div.append(createBrElement());
    this.div.append(this.verifyPasswordLabel);
    this.div.append(createBrElement());
    this.div.append(this.verifyPasswordInput);
  }

  updatePassword() {
    const token = getParam('token');
    const loginValue = this.loginInput.value;
    const passwordValue = this.passwordInput.value;
    const verifyPasswordValue = this.verifyPasswordInput.value;

    if (loginValue && passwordValue && verifyPasswordValue
      && passwordValue === verifyPasswordValue) {
      postData(`${SERVER_URL}/reset-password`, {
        token, password: passwordValue, verifiedPassword: verifyPasswordValue, email: loginValue,
      })
        .then((response) => {
          console.log(response.message);
          window.alert(response.message);
          if (response.status === 200) {
            this.startScene('Title');
          }
        })
        .catch((error) => {
          console.log(error.message);
          window.alert('we encountered an error');
        });
    } else {
      window.alert('all fields must be filled out and the passwords must match');
    }
  }
}
