import * as zod from "zod"

export const formSchema = zod.object({
  firstname: zod.string().min(1, { message: "Bitte gib deinen Vornamen ein" }),
  lastname: zod.string().min(1, { message: "Bitte gib deinen Nachnamen ein" }),
  event: zod.string().refine(
    (value) => {
      if (value === "") {
        return false
      }
      return true
    },
    { message: "Bitte wähle ein Event aus" }
  ),
  email: zod.string().email({ message: "Bitte gib eine gültige E-Mail Adresse ein" }).optional().or(zod.literal("")),
  dojo: zod.string().refine(
    (value) => {
      if (value === "") {
        return false
      }
      return true
    },
    { message: "Bitte wähle ein Dojo aus" }
  ),
  comments: zod.string().optional(),
  options: zod.record(zod.union([zod.number(), zod.boolean(), zod.string(), zod.null()])).default({}),
  captchatoken: zod.string({ message: "Bitte gib das Captcha ein" }),
})

export type TFormSchema = zod.infer<typeof formSchema>

export const formSchemaOrders = zod.object({
  name: zod.string().min(1, { message: "Bitte gib deinen Namen ein" }),
  // products: zod.array(zod.string()).refine((value) => value.some((item) => item), {
  //   message: "Wähle mindestens ein Produkt aus",
  // }),
  products: zod.array(
    zod.object({
      quantity: zod
        .number({
          invalid_type_error: "Bitte gib eine gültige Zahl ein",
        })
        .min(0)
        .or(zod.nan()) // Optional, falls NaN-Werte behandelt werden sollen
        .optional(), // Dies erlaubt, dass das Feld leer sein kann
    })
  ),
  email: zod.string().email({ message: "Bitte gib eine gültige E-Mail Adresse ein" }).optional().or(zod.literal("")),
  comments: zod.string().optional(),
  captchatoken: zod.string({ message: "Bitte gib das Captcha ein" }),
})

export type TFormSchemaOrders = zod.infer<typeof formSchemaOrders>
