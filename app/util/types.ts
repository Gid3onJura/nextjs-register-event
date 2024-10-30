import * as zod from "zod"

export const formSchema = zod.object({
  name: zod.string().min(1, { message: "Bitte gib deinen Namen ein" }),
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
})

export type TFormSchema = zod.infer<typeof formSchema>
