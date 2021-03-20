from .land import *


class Board(object):

    def __init__(self):
        self._lands = []
        self.generate_lands()

    def get_lands(self):
        return self._lands

    def get_land(self, index):
        return self._lands[index]

    def generate_lands(self):
        self._lands.append(Land(0, "Rotunda", StartLand(START_REWARD)))
        self._lands.append(Land(1, "Economics and Finance Department", ConstructionLand(3500)))
        self._lands.append(Land(2, "Saraswati Temple", ChanceLand()))
        self._lands.append(Land(3, "CSIS Department", ConstructionLand(4000)))
        self._lands.append(Land(4, "Mathematics Department", Infra(3250)))
        self._lands.append(Land(5, "Vyas Bhavan", Infra(2000)))
        self._lands.append(Land(6, "Shankar Bhavan", ConstructionLand(2250)))
        self._lands.append(Land(7, "Student Activity Center", ChanceLand()))
        self._lands.append(Land(8, "Gandhi Bhavan", ConstructionLand(3500)))
        self._lands.append(Land(9, "Krishna Bhavan", ConstructionLand(3750)))
        self._lands.append(Land(10, "Department of Electrical and Electronics Engineering", Infra(2000)))
        self._lands.append(Land(11, "Department of Mechanical Engineering", ConstructionLand(1750)))
        self._lands.append(Land(12, "Vishwakarma Bhavan", Infra(2500)))
        self._lands.append(Land(13, "Bhagirath Bhavan", ConstructionLand(1500)))
        self._lands.append(Land(14, "ANC", ConstructionLand(3250)))
        self._lands.append(Land(15, "Gym-G and Amul", Infra(3500)))
        self._lands.append(Land(16, "C'Not", ConstructionLand(4000)))
        self._lands.append(Land(17, "Med-C", ChanceLand()))
        self._lands.append(Land(18, "Ashok Bhavan", ConstructionLand(1250)))
        self._lands.append(Land(19, "Rana Pratap Bhavan", ConstructionLand(1000)))
        self._lands.append(Land(20, "Shiv Ganga", ChanceLand()))
        self._lands.append(Land(21, "Department of Civil Engineering", ConstructionLand(2750)))
        self._lands.append(Land(22, "Placement Unit", ChanceLand()))
        self._lands.append(Land(23, "LTC", ConstructionLand(3000)))
        self._lands.append(Land(24, "SR Bhavan", ConstructionLand(2000)))
        self._lands.append(Land(25, "AUDI and IC", Infra(2500)))
        self._lands.append(Land(26, "Sky Lawns and Museum", ConstructionLand(4000)))
        self._lands.append(Land(27, "Malviya and MSA", ConstructionLand(2250)))
        self._lands.append(Land(28, "Looters", Infra(3500)))
        self._lands.append(Land(29, "ToTT and -301F", ConstructionLand(3750)))
        self._lands.append(Land(30, "Department of Chemical Engineering", Infra(3000)))
        self._lands.append(Land(31, "Meera Bhavan", ConstructionLand(3000)))
        self._lands.append(Land(32, "Budh Bhavan", ConstructionLand(2500)))
        self._lands.append(Land(33, "Library", ChanceLand()))
        self._lands.append(Land(34, "Ram Bhavan", ConstructionLand(2500)))
        self._lands.append(Land(35, "Department of Biology + Department of Pharmacy", Infra(2000)))
        self._lands.append(Land(36, "S9", ChanceLand()))
        self._lands.append(Land(37, "Department of Chemistry", ConstructionLand(1500)))
        self._lands.append(Land(38, "Department of Physics", Infra(1250)))
        self._lands.append(Land(39, "Clock Tower", ConstructionLand(4500)))

    def get_grid_num(self):
        return len(self._lands)


def test():
    b = Board()
    assert b.get_land(1).get_position() == 1
    assert b.get_land(10).get_content().get_type() == LandType.JAIL


if __name__ == "__main__":
    test()