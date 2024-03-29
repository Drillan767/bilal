import { email, image, max, mimes, min, one_of as oneOf, required } from '@vee-validate/rules'
import { configure, defineRule } from 'vee-validate'
import { localize } from '@vee-validate/i18n'
import en from '@vee-validate/i18n/dist/locale/en.json'

export default defineNuxtPlugin(() => {
    defineRule('email', email)
    defineRule('required', required)
    defineRule('min', min)
    defineRule('max', max)
    defineRule('image', image)
    defineRule('mimes', mimes)
    defineRule('oneOf', oneOf)

    configure({
        generateMessage: localize({ en }),
    })
})
