function json(url) {
  return fetch(url).then(res => res.json());
}
json(`https://api.ipdata.co?api-key=be0f755b93290b4c100445d77533d291763a417c75524e95e07819ad`).then(data => {
  console.log(`${data.ip} ${data.city} ${data.country_code}, ${String(new Date).split(" ", 5).join(" ")}`);
  // so many more properties
});
