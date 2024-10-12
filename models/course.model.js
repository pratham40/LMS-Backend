import { model, Schema } from "mongoose"

const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
        minLength:[8,"tittle must be atleast 8 character"],
        maxLength:[32,"tittle must be atmost 32 character"],
        trim: true
    },
    description: {
        type: String,
        required: true,
        minLength:[8,"description must be atleast 8 character"],
        maxLength:[2000,"description must be atmost 2000 character"]
    },
    category: {
        type: String,
        required: ['true','category is required'],
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true
                },
                secure_url: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    numbersOfLectures: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)

const Course = model("Course", courseSchema)

export default Course