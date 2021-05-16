import { io } from "../http";
import { ConnectionsService } from "../services/ConnectionsService";
import { UsersService } from "../services/UsersService";
import { MessagesService } from "../services/MessagesService";

interface IParams {
    text: string;
    email: string
}

io.on("connect", (socket) => {
    
    const connectionsService = new ConnectionsService();
    const usersService = new UsersService();
    const messagesService = new MessagesService();
    
    socket.on("client_first_access", async (params) => {

        const socket_id = socket.id;
        const { text, email} = params as IParams; // força Params para não ser informado nada diferente
        let user_id = null;

        const userExists = await usersService.findByEmail(email);
        
        if(!userExists) {
            const user = await usersService.create(email);

            await connectionsService.create({
                socket_id,
                user_id: user.id
            });

            user_id = user.id; // Se entrar no if, variável iniciada em null recebe user.id
        } else {
            user_id = userExists.id;
            const connection = await connectionsService.findByUserId(userExists.id); // se usuário existir busca pelo id

            if(!connection) { // se não existir conexão, cria a conexão com o socket
                await connectionsService.create({
                    socket_id,
                    user_id: userExists.id
                })
            } else {
                connection.socket_id = socket_id;

                await connectionsService.create(connection); // se existir somente sobreescreve
            }
        }

        await messagesService.create({
            text,
            user_id //cria mensagem contendo user_id se usuário ainda não existir, se existir mantém usuário com nova mensagem
        });

        const allMessages = await messagesService.listByUser(user_id);

        socket.emit("client_list_all_messages", allMessages);

        const allUsers = await connectionsService.findAllWithoutAdmin();
        io.emit("admin_list_all_users", allUsers);
    });


    socket.on("client_send_to_admin",  async params => {
        const {text, socket_admin_id } = params;

        const socket_id = socket.id;

        const { user_id } = await connectionsService.findBySocketId(socket_id);

        const message = await messagesService.create({
            text,
            user_id
        });

        io.to(socket_admin_id).emit("admin_receive_message", {
            message,
            socket_id
        });
    });
});