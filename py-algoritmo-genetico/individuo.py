class Individuo():
    
    def __init__(self):
        self.tronco = None
        self.pe1 = None
        self.pe2 = None
        
    def movePes(self):
        self.tronco.setH(self.tronco, -1)
        self.pe1.setH(self.pe1, 1)
        self.pe2.setH(self.pe2, -1)