export async function getlocation(ip: string) {
  try {
    // Use wttr.in service which doesn't require an API key
    const response = await fetch(
      `https://api.ip2location.io/?key=46D1A198D634E7D6520B93F69FDBAE40&ip=${ip}&format=json`,
      { next: { revalidate: 1800 } }, // Cache for 30 minutes
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Location "${location}" not found. Please check the spelling and try again.`)
      }
      throw new Error(`Weather service error: ${response.status}`)
    }

    const data = (await response.json()) 

    return {
        ip:data.ip,
        country_name: data.country_name,
        region_name:data.region_name,
        city_name:data.city_name,
        latitude:data.latitude,
        longitude:data.longitude,
        success:true,
        message:'',
      }
}catch(ex:any){
    return {
        success:false,
        message:ex.message,
      }
}
}