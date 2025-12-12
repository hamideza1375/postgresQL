import Yup from "yup";


exports.RegisterValidator = Yup.object().shape({
    username: Yup.string().required(),
    phoneOrEmail: Yup.string().required(),
    password: Yup.string().min(6).max(20).required(),
});


