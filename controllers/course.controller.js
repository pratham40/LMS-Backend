import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js"
import cloudinary from "cloudinary"
import fs from "fs"

const getAllCourses = async function (re, res, next) {
    try {
        const courses = await Course.find({}).select("-lectures")
        res.status(200).json({
            success: true,
            message: 'All Courses',
            courses
        })
    } catch (error) {
        next(new AppError(error.message, 400))
    }
}

const getLecturesByCourseId = async function (req, res, next) {
    try {
        const { id } = req.params
        const course = await Course.findById(id)
        if (!course) {
            return next(new AppError("Course not found", 404))
        }
        res.status(200).json({
            success: true,
            message: `All lectures of course ${course.title}`,
            lectures: course.lectures
        })
    } catch (error) {
        next(new AppError(error.message, 400))
    }
}

const createCourse = async function (req, res, next) {
    const { title, description, category, createdBy,thumbnail} = req.body
    if (!title || !description || !category || !createdBy) {
        return next(new AppError("All fields are required", 400))
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: "default",
            secure_url: "dummy"
        }
    })

    if (!course) {
        return next(new AppError("Course not created", 500))
    }

    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "lms"
            })
            if (result) {
                course.thumbnail = {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                }
                fs.unlinkSync(req.file.path)
            }
        } catch (error) {
            return next(new AppError(error.message, 500))
        }

    }

    await course.save()
    res.status(201).json({
        success: true,
        message: "Course created successfully",
        course
    })

}

const updateCourse = async function (req, res, next) {
    try {
        const { id } = req.params
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set:req.body
            },
            {
                runValidators: true
            }
        )
        if (!course) {
            return next(new AppError("Course not found", 404))
        }

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        })

    } catch (error) {
        next(new AppError(error.message, 400))
    }
}

const removeCourse = async function (req, res, next) {
    try {
        const { id } = req.params
        const course = await Course.findByIdAndDelete(id)
        if (!course) {
            return next(new AppError("Course not found", 404))
        }
        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (error) {
        next(new AppError(error.message, 400))
    }
}


const addLecturesByCourseId=async (req,res,next) => {
    try {
        const { id } = req.params
        const course = await Course.findById(id)
        if (!course) {
            return next(new AppError("Course not found", 404))
        }

        const {title,description}=req.body
        if (!title || !description) {
            return next(new AppError("All fields are required", 400))
        }
        const lectureData={
            title,
            description,
            lecture: {
                public_id: "default",
                secure_url: "dummy"
            }
        }

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "lms",
                    resource_type: "video", // Specify resource type as video
                    chunk_size: 6000000, // Use chunked upload for large files
                    eager: [
                        // Create an optimized version
                        { 
                            streaming_profile: "full_hd",
                            format: "m3u8" 
                        }
                    ],
                    eager_async: true // Process optimizations asynchronously
                })
                if (result) {
                    lectureData.lecture = {
                        public_id: result.public_id,
                        secure_url: result.secure_url
                    }
                    fs.unlinkSync(req.file.path)
                }
            } catch (error) {
                // Clean up file if upload fails
                if(req.file) {
                    fs.unlinkSync(req.file.path)
                }
                return next(new AppError(error.message, 500))
            }
        }

        course.lectures.push(lectureData)
        course.numbersOfLectures=course.lectures.length

        await course.save()
        res.status(200).json({
            success: true,
            message: "Lecture added successfully",
            course
        })
    } catch (error) {
        // Clean up file if any other error occurs
        if(req.file) {
            fs.unlinkSync(req.file.path)
        }
        next(new AppError(error.message, 400))
    }
}

const deleteLectureFromCourse=async (req,res,next) => {
    try {
        const { id, lectureId } = req.params
        const course = await Course.findById(id)
        if (!course) {
            return next(new AppError("Course not found", 404))
        }
        const lectureIndex = course.lectures.findIndex(lecture => lecture._id.toString() === 
        lectureId)
        if (lectureIndex === -1) {
            return next(new AppError("Lecture not found", 404))
        }
        course.lectures.splice(lectureIndex, 1)
        course.numbersOfLectures = course.lectures.length
        await course.save()
        res.status(200).json({
            success: true,
            message: "Lecture deleted successfully",
            course
        })
        } catch (error) {
            next(new AppError(error.message, 400))
        }
}

export { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse,addLecturesByCourseId,deleteLectureFromCourse }