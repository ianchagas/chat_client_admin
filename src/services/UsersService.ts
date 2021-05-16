import { getCustomRepository, Repository } from "typeorm";
import { User } from "../entities/User";
import { UsersRepository } from "../repositories/UsersRepository";


class UsersService {

    constructor() {
        this.usersRepository = getCustomRepository(UsersRepository);
    }

    private usersRepository: Repository<User>;

    async findByEmail(email: string) {

        //Verifica se o usuário existe
        const userExists = await this.usersRepository.findOne({
            email
        });

        // Se existir, retornar o user
        if (userExists) {
            return userExists;
        }
    }

    async create(email: string) {

        // Se não existir usuario, salvar no DB
        const user = this.usersRepository.create({
            email
        });
        await this.usersRepository.save(user);
        
        return user;
    }
}

export { UsersService };