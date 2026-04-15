import RegisterUser from '../../Domains/users/entities/RegisterUser.js';
import RegisteredUser from '../../Domains/users/entities/RegisteredUser.js';

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const registerUser = new RegisterUser(useCasePayload);
    await this._userRepository.verifyAvailableUsername(registerUser.username);
    registerUser.password = await this._passwordHash.hash(registerUser.password);
    const registeredUser = await this._userRepository.addUser(registerUser);
    return new RegisteredUser(registeredUser);
  }
}

export default AddUserUseCase;
