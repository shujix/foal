import { deepStrictEqual, strictEqual } from 'assert';
import { Config, ConfigTypeError } from '../../core';
import { _instanceWrapper, getAjvInstance } from './get-ajv-instance';

describe('getAjvInstance', () => {

  it('should use defaults.', () => {
    const schema = {
      properties: {
        foo: { type: 'string', default: 'bar' }
      },
      type: 'object',
    };
    const data = {};
    getAjvInstance().validate(schema, data);
    strictEqual((data as any).foo, 'bar');
  });

  it('should remove additional properties.', () => {
    const schema = {
      additionalProperties: false,
      properties: {},
      type: 'object',
    };
    const data = { hello: 'world' };
    getAjvInstance().validate(schema, data);
    strictEqual(data.hasOwnProperty('hello'), false);
  });

  it('should coerce types.', () => {
    const schema = {
      properties: {
        foo: { type: 'number' }
      },
      type: 'object',
    };
    const data = {
      foo: '3'
    };
    getAjvInstance().validate(schema, data);
    strictEqual(data.foo, 3);
  });

  describe('', () => {

    beforeEach(() => {
      delete (_instanceWrapper as any).instance;
      Config.set('settings.ajv.coerceTypes', false);
      Config.set('settings.ajv.removeAdditional', false);
      Config.set('settings.ajv.useDefaults', false);
      Config.set('settings.ajv.nullable', true);
      Config.set('settings.ajv.allErrors', true);
    });

    it('should accept custom configuration from the Config.', () => {
      const schema = {
        additionalProperties: false,
        properties: {
          foo: { type: 'number', default: 4, nullable: true }
        },
        type: 'object',
      };

      const ajv = getAjvInstance();

      // coerceTypes
      const data = {
        foo: '3'
      };
      strictEqual(ajv.validate(schema, data), false, 'Types should not be coerced.');

      // removeAdditional
      const data2 = {
        bar: 'hello',
        foo: 3,
      };
      strictEqual(ajv.validate(schema, data2), false, 'Additional properties should not be removed.');

      // useDefaults
      const data3 = {};
      ajv.validate(schema, data3);
      strictEqual((data3 as any).foo, undefined);

      // nullable
      const data4 = {
        foo: null
      };
      strictEqual(ajv.validate(schema, data4), true, 'Property "foo" should be nullable.');

      // allErrors
      const schema5 = {
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
        },
        type: 'object',
      };
      const data5 = {
        a: 'c',
        b: 'd'
      };
      strictEqual(ajv.validate(schema5, data5), false);
      deepStrictEqual(ajv.errors, [
        {
          dataPath: '.a',
          keyword: 'type',
          message: 'should be number',
          params: { type: 'number' },
          schemaPath: '#/properties/a/type',
        },
        {
          dataPath: '.b',
          keyword: 'type',
          message: 'should be number',
          params: { type: 'number' },
          schemaPath: '#/properties/b/type',
        },
      ]);
    });

    it('should throw a ConfigTypeError when the value of `settings.ajv.coerceTypes` has an invalid type.', () => {
      Config.set('settings.ajv.coerceTypes', 'hello');

      try {
        getAjvInstance().validate({}, {});
      } catch (error) {
        if (!(error instanceof ConfigTypeError)) {
          throw new Error('A ConfigTypeError should have been thrown');
        }
        strictEqual(error.key, 'settings.ajv.coerceTypes');
        strictEqual(error.expected, 'boolean');
        strictEqual(error.actual, 'string');
        return;
      }

      throw new Error('An error should have been thrown');
    });

    it('should throw a ConfigTypeError when the value of `settings.ajv.nullable` has an invalid type.', () => {
      Config.set('settings.ajv.nullable', 'hello');

      try {
        getAjvInstance().validate({}, {});
      } catch (error) {
        if (!(error instanceof ConfigTypeError)) {
          throw new Error('A ConfigTypeError should have been thrown');
        }
        strictEqual(error.key, 'settings.ajv.nullable');
        strictEqual(error.expected, 'boolean');
        strictEqual(error.actual, 'string');
        return;
      }

      throw new Error('An error should have been thrown');
    });

    it('should throw a ConfigTypeError when the value of `settings.ajv.allErrors` has an invalid type.', () => {
      Config.set('settings.ajv.allErrors', 'hello');

      try {
        getAjvInstance().validate({}, {});
      } catch (error) {
        if (!(error instanceof ConfigTypeError)) {
          throw new Error('A ConfigTypeError should have been thrown');
        }
        strictEqual(error.key, 'settings.ajv.allErrors');
        strictEqual(error.expected, 'boolean');
        strictEqual(error.actual, 'string');
        return;
      }

      throw new Error('An error should have been thrown');
    });

    after(() => {
      delete (_instanceWrapper as any).instance;
      Config.remove('settings.ajv.coerceTypes');
      Config.remove('settings.ajv.removeAdditional');
      Config.remove('settings.ajv.useDefaults');
      Config.remove('settings.ajv.nullable');
      Config.remove('settings.ajv.allErrors');
    });

  });

});
