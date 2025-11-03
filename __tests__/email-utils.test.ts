import { normalizeEmail, isValidEmail } from '@/lib/email-utils'

describe('email-utils', () => {
  describe('normalizeEmail', () => {
    describe('Gmail normalization', () => {
      it('should remove + aliases from Gmail addresses', () => {
        expect(normalizeEmail('akihiro19970324+1@gmail.com')).toBe('akihiro19970324@gmail.com')
        expect(normalizeEmail('user+test@gmail.com')).toBe('user@gmail.com')
        expect(normalizeEmail('test+alias+multiple@gmail.com')).toBe('test@gmail.com')
      })

      it('should remove dots from Gmail local part', () => {
        expect(normalizeEmail('test.user@gmail.com')).toBe('testuser@gmail.com')
        expect(normalizeEmail('a.k.i.h.i.r.o@gmail.com')).toBe('akihiro@gmail.com')
      })

      it('should handle both dots and + aliases in Gmail', () => {
        expect(normalizeEmail('test.user+alias@gmail.com')).toBe('testuser@gmail.com')
        expect(normalizeEmail('a.b.c+tag@gmail.com')).toBe('abc@gmail.com')
      })

      it('should work with googlemail.com domain', () => {
        expect(normalizeEmail('test+1@googlemail.com')).toBe('test@googlemail.com')
        expect(normalizeEmail('test.user@googlemail.com')).toBe('testuser@googlemail.com')
      })
    })

    describe('Outlook/Hotmail normalization', () => {
      it('should remove + aliases from Outlook addresses', () => {
        expect(normalizeEmail('user+test@outlook.com')).toBe('user@outlook.com')
        expect(normalizeEmail('test+alias@hotmail.com')).toBe('test@hotmail.com')
        expect(normalizeEmail('user+tag@live.com')).toBe('user@live.com')
        expect(normalizeEmail('test+1@msn.com')).toBe('test@msn.com')
      })

      it('should NOT remove dots from Outlook addresses', () => {
        expect(normalizeEmail('test.user@outlook.com')).toBe('test.user@outlook.com')
        expect(normalizeEmail('a.b.c@hotmail.com')).toBe('a.b.c@hotmail.com')
      })
    })

    describe('Yahoo normalization', () => {
      it('should remove - aliases from Yahoo addresses', () => {
        expect(normalizeEmail('user-test@yahoo.com')).toBe('user@yahoo.com')
        expect(normalizeEmail('test-alias@yahoo.co.jp')).toBe('test@yahoo.co.jp')
        expect(normalizeEmail('user-tag@ymail.com')).toBe('user@ymail.com')
      })
    })

    describe('Other providers normalization', () => {
      it('should remove + aliases from other providers', () => {
        expect(normalizeEmail('user+test@example.com')).toBe('user@example.com')
        expect(normalizeEmail('test+alias@company.co.jp')).toBe('test@company.co.jp')
      })
    })

    describe('Case sensitivity and whitespace', () => {
      it('should convert to lowercase', () => {
        expect(normalizeEmail('Test+User@Gmail.COM')).toBe('testuser@gmail.com')
        expect(normalizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com')
      })

      it('should trim whitespace', () => {
        expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com')
        expect(normalizeEmail(' user+tag@gmail.com ')).toBe('user@gmail.com')
      })
    })

    describe('Error handling', () => {
      it('should throw error for invalid email', () => {
        expect(() => normalizeEmail('not-an-email')).toThrow('Invalid email format')
        expect(() => normalizeEmail('missing@domain')).toThrow('Invalid email format')
        expect(() => normalizeEmail('@example.com')).toThrow('Invalid email format')
        expect(() => normalizeEmail('user@')).toThrow('Invalid email format')
      })

      it('should throw error for empty or null email', () => {
        expect(() => normalizeEmail('')).toThrow('Invalid email address')
        expect(() => normalizeEmail(null as any)).toThrow('Invalid email address')
        expect(() => normalizeEmail(undefined as any)).toThrow('Invalid email address')
      })

      it('should throw error for non-string input', () => {
        expect(() => normalizeEmail(123 as any)).toThrow('Invalid email address')
        expect(() => normalizeEmail({} as any)).toThrow('Invalid email address')
      })
    })

    describe('Real-world test cases', () => {
      it('should prevent common alias abuse patterns', () => {
        const baseEmail = 'akihiro19970324@gmail.com'
        const aliases = [
          'akihiro19970324+1@gmail.com',
          'akihiro19970324+2@gmail.com',
          'akihiro19970324+test@gmail.com',
          'a.k.i.h.i.r.o.1.9.9.7.0.3.2.4@gmail.com',
          'Akihiro19970324@Gmail.com',
        ]

        aliases.forEach((alias) => {
          expect(normalizeEmail(alias)).toBe(baseEmail)
        })
      })
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user+tag@domain.co.jp')).toBe(true)
      expect(isValidEmail('test.user@subdomain.example.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('not-an-email')).toBe(false)
      expect(isValidEmail('missing@domain')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should reject non-string inputs', () => {
      expect(isValidEmail(null as any)).toBe(false)
      expect(isValidEmail(undefined as any)).toBe(false)
      expect(isValidEmail(123 as any)).toBe(false)
      expect(isValidEmail({} as any)).toBe(false)
    })
  })
})
