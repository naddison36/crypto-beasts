

contract CryptoBeastsTypes {
    
    struct CardProperties {
        uint16 health;
        uint16 defence;
        uint16 mana;
        uint16 attack;
        uint16 specialAttack;
    }

    struct Ability {
        string name;
        CardProperties opponent;
        CardProperties player;
        uint16 manaCost;
    }

    struct Card {
        string name;
        Ability ability;

        uint16 initHealth;  // 0-1000
        uint16 initDefence; // 0-500
        uint16 initMana;    // 0-20

        uint16 speed;   // 0-500
        uint16 attack; // 0-120
        uint16 specialAttack; // 120-240
    }
}