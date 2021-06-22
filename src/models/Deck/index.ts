import { Types, model, Schema } from "mongoose";
import { validateName, validateDescription } from "./validate";
import { TDeckDocument } from "./IDeck";
import Card from "../Review";
import User from "../authentication/User";

const DeckSchema = new Schema<TDeckDocument>(
    {
        name: {
            type: String,
            required: true,
            validate: { validator: validateName, msg: "Text is too long or incorrect" },
        },
        description: {
            type: String,
            validate: { validator: validateDescription, msg: "Text is incorrect" },
        },
        cards: {
            type: [Types.ObjectId],
            required: true,
        },
        isPrivate: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true }
);

DeckSchema.pre("remove", async function (next) {
    const cardPromise = Card.deleteOne({
        _id: {
            $in: this.cards,
        },
    }).exec();

    const userPromise = User.updateMany(
        {},
        {
            $pull: {
                "profile.privateDecks": this._id,
                "profile.reviewedDecks": this._id,
            },
        }
    ).exec();

    await Promise.all([cardPromise, userPromise]);
    next();
});

export default model<TDeckDocument>("Deck", DeckSchema);
