const HeroSection=()=>{
    return (
        <picture className="w-full h-auto pointer-events-none select-none">
            <source media="(min-width: 768px)" srcSet="/hero_dextop.png" />
            <img src="/hero_mobile.png" alt="Quiz Hero" className="w-full h-auto object-contain" />
        </picture>
    )
}
export default HeroSection
