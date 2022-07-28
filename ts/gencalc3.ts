interface CharacterSelectItem {
    name: string,
    master: Object
}

interface WeaponSelectItem {
    name: string,
    master: Object
}

interface CharacterMaster {
    名前: string,
    icon_url: string,
    説明: string | Array<string>,
    ステータス: {
        基礎HP: Object,
        基礎攻撃力: Object,
        基礎防御力: Object,
        'HP%': Object        
    }

}


interface WeaponMaster {
    名前: string,
    icon_url: string,
    説明: string,
    武器スキル: {
        
    }

}