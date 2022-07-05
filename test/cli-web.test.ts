import * as cliweb from '../src/cli-web'
describe('cli-web', () => {
  // verify
  test('verify', () => {
    expect(cliweb.Terminal == undefined).toEqual(false);
    expect(cliweb.RichTerminal == undefined).toEqual(false);
  })
})