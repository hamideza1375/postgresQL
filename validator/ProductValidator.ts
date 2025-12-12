import Yup from "yup";


exports.ConfirmPaymentShama = Yup.object().shape({
    phone: Yup.string().required(),
    unit: Yup.number().required(),
    plaque: Yup.number().required(),
    address: Yup.string().required(),
});