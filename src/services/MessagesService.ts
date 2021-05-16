import { getCustomRepository, Repository } from "typeorm"
import { Message } from "../entities/Message";
import { MessagesRepository } from "../repositories/MessagesRepository"

interface IMessageCreate {
    admin_id?: string;
    text: string;
    user_id: string;
}

class MessagesService {

    private messagesRepository: Repository<Message>;

    constructor() {
        this.messagesRepository = getCustomRepository(MessagesRepository);
    }

    async create({ admin_id, text, user_id}: IMessageCreate) {

        const message = this.messagesRepository.create({
            admin_id,
            text,
            user_id
        });

        await this.messagesRepository.save(message);

        return message;
    }

    async listByUser(user_id: string) {

        const list = await this.messagesRepository.find({
            where: { user_id },

            relations: [    //Dentro da entidade, ele busca o relacionamento com alguma tabela criada,
                "user"      //No caso está buscando lá da entities/Users.ts onde colocamos o join column e listando
            ]               //id do usuario, email e created_at da tabela users, no json de retorno do GET buscando
                            //o id especifico pelo objeto referenciado nesse metódo
        });

        return list;
    }
}

export { MessagesService }