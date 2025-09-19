function DummyPage(){

    const t1 = "itha da text1"
    const t2 = "itha da text2"
    const t3 = "itha da text3"
    const t4 = "itha da text4"
    return (
        <div className="flex justify-center items-center h-screen w-screen bg-red-800">
            <code className="text-[#e7d1d1] font-bold text-6xl bg-red-900 p-5 flex flex-col">
                <div>{t1}</div>
                <div>{t2}</div>
                <div>{t3}</div>
                <div>{t4}</div>
            </code>
        </div>
    )
}

export default DummyPage;