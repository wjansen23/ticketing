import mongoose from "mongoose";
import { Password } from "../services/password";

//An interface that describes the properties required to create a new user
interface UserAttrs {
    email: string;
    password: string;
}

//An interface the describes the properties that a user model has (i.e. Collection)
interface UserModel extends mongoose.Model<UserDocument> {
    build(attrs: UserAttrs): UserDocument;
}

//An interface the desribes the properties a user document has
interface UserDocument extends mongoose.Document{
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
},{toJSON:{
    transform(doc,ret){
        ret.id = ret._id;
        delete ret._id;
        delete ret.password; //remove property off object
        delete ret.__v;
    }
}
});

userSchema.pre('save',async function (done){
    if (this.isModified('password')){
        const hashed = await Password.toHash(this.get('password'));
        this.set('password',hashed);
    }
    done();
});

userSchema.statics.build = (attrs:UserAttrs)=>{
    return new User(attrs);
}

const User = mongoose.model<UserDocument, UserModel>('User',userSchema);

export {User}