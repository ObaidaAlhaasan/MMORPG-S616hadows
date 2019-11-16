import CredentialsBaseScene from './CredentialsBaseScene';
import {
  postData, createLabel, createInputField, createBrElement,
} from '../utils/utils';

export default class SignUpScene extends CredentialsBaseScene {
  constructor() {
    super('SignUp');
  }

  create() {
    this.createUi('Sign Up', this.signUp.bind(this), 'Back', this.startScene.bind(this, 'Title'));
    this.createUserNameInput();
  }

  createUserNameInput() {
    this.userNameLabel = createLabel('username', 'Username:', 'form-label');
    this.userNameInput = createInputField('text', 'username', 'username', 'login-input', 'Username');

    this.div.append(createBrElement());
    this.div.append(createBrElement());
    this.div.append(this.userNameLabel);
    this.div.append(createBrElement());
    this.div.append(this.userNameInput);
  }

  signUp() {
    const loginValue = this.loginInput.value;
    const passwordValue = this.passwordInput.value;
    const userNameValue = this.userNameInput.value;

    if (loginValue && passwordValue && userNameValue) {
      postData(`${SERVER_URL}/signup`, { email: loginValue, password: passwordValue, username: userNameValue })
        .then((response) => {
          if (response.status === 200) {
            window.alert(response.message);
            this.startScene('Login');
          } else {
            console.log(response);
            window.alert('Invalid username or password.');
          }
        })
        .catch((error) => {
          console.log(error.message);
          window.alert('Invalid username or password.');
        });
    } else {
      window.alert('all fields must be filled out');
    }
  }
}
