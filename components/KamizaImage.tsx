import Image from "next/image"

const KamizaImage = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full max-w-sm">
        <Image
          src={"kamiza.svg"}
          alt="kamiza"
          width={300} // Desired width
          height={100} // Desired height
          className="rounded-lg object-cover"
          // priority // Preload image
        />
      </div>
    </div>
  )
}

export default KamizaImage
