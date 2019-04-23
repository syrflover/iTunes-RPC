const imageToBase64 = (data: Buffer) => {
  return `data:image/jpeg;base64,${Buffer.from(data).toString('base64')}`;
};

export default imageToBase64;
