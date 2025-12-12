import Yup from "yup";

exports.CategoryValidator = Yup.object().shape({
    title: Yup.string().required(),
});

exports.ProductCategoryValidator = Yup.object().shape({
    title: Yup.string().required(),
    price: Yup.number().required(),
    info: Yup.string().required(),
});