// 0x7613 writable
export const characteristicId =
  "00007613-0000-1000-8000-00805F9B34FB".toLowerCase();

// 0x180a? 0x7610
export const serviceId = "00007610-0000-1000-8000-00805F9B34FB".toLowerCase();

export const stickLocalName = "MD000000000000";

// 0x7616 read/write/subscribable, what can we do about it?

// FIXME: can we find it in the LightBlue app?
// export const stickCompanyIdentifier = 0x0; 

// 请使用 Chrome 浏览器并确保电脑上有蓝牙设备
export const checkWebBluetoothAvailability = async () => {
  return !!navigator.bluetooth && (await navigator.bluetooth.getAvailability());
};

export const requestStick = () => {
  return navigator.bluetooth
    .requestDevice({
      filters: [{ name: stickLocalName }],
      optionalServices: [serviceId.toLowerCase()],
    })
    .then((device) => {
      return device;
    });
};

/***
 * need help, how is this code implemented? this code is reversed from mini-program
 * @param t string - hex code of color; etc: #ffffff
 * @param n boolean - turn on ?
 * @param e boolean - breath
 * @param r number -
 */
export const convertToHex = (t: string, n: boolean, e: boolean, r: number) => {
  var o = (function (t) {
      var n = t.replace("#", "");
      return [
        parseInt(n.substring(0, 2), 16),
        parseInt(n.substring(2, 4), 16),
        parseInt(n.substring(4, 6), 16),
      ];
    })(t),
    i = n ? -1 : 0,
    a = e ? -1 : 0,
    u = ((255 - (255 - (Math.pow(16 - r, 2) - 1))) << 24) >> 24,
    c = new ArrayBuffer(8),
    s = new DataView(c);
  return (
    s.setUint8(0, -86),
    s.setUint8(1, -95),
    s.setUint8(2, o[0]),
    s.setUint8(3, o[1]),
    s.setUint8(4, o[2]),
    s.setUint8(5, i),
    s.setUint8(6, a),
    s.setUint8(7, u),
    c
  );
};

/**
 * need help! how to pass the 2nd 3rd 4th param of convertToHex
 * @param param0
 * @returns
 */
export const writeTo = ({
  color,
  device,
  n = true,
  e = false,
  r = 5,
}: {
  color: string;
  device: BluetoothDevice;
  n?: boolean;
  e?: boolean;
  r?: number;
}) => {
  const signal = convertToHex(color, n, e, r);
  return device.gatt
    ?.connect()
    .then((server) => server?.getPrimaryService(serviceId)) // 使用服务UUID获取服务
    .then((service) => service?.getCharacteristic(characteristicId)) // 使用特征UUID获取特征
    .then((characteristic) => characteristic.writeValueWithResponse(signal));
};


