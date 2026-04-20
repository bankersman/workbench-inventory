describe('ScannerService', () => {
  const original = process.env.SCANNER_PORT;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SCANNER_PORT;
    } else {
      process.env.SCANNER_PORT = original;
    }
    jest.resetModules();
  });

  it('isEnabled is false when SCANNER_PORT is unset', async () => {
    delete process.env.SCANNER_PORT;
    jest.resetModules();
    const { ScannerService } = await import('./scanner.service');
    const svc = new ScannerService();
    expect(svc.isEnabled()).toBe(false);
  });

  it('isEnabled is true when SCANNER_PORT is set', async () => {
    process.env.SCANNER_PORT = '/dev/ttyUSB0';
    jest.resetModules();
    const { ScannerService } = await import('./scanner.service');
    const svc = new ScannerService();
    expect(svc.isEnabled()).toBe(true);
  });
});
