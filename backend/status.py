import threading
import time

class Status:
    def __init__(self):
        self.dados = {
            'carboidrato': 0,
            'glicemia': 0,
            'proteina': 0,
            'xp': 0,
        }
        self.decaimento_ativo = True
        self.iniciar_decaimento()

    def _verificar_limites(self):
        for key in self.dados:
            if self.dados[key] > 100:
                self.dados[key] = 100
            elif self.dados[key] < 0:
                self.dados[key] = 0

    def _print_dados(self):
        print(self.dados)

    def adicionar_cerboidratos(self):
        self.dados['carboidrato']   += 3
        self.dados['glicemia']      += 2
        self.dados['xp']            += 6
        self._verificar_limites()

    def adicionar_frutas(self):
        self.dados['carboidrato']   += 2
        self.dados['glicemia']      += 1
        self.dados['xp']            += 7
        self._verificar_limites()

    def adicionar_legumes(self):
        self.dados['carboidrato']   += 1
        self.dados['proteina']      += 1
        self.dados['xp']            += 8
        self._verificar_limites()

    def adicionar_leite_e_derivados(self):
        self.dados['proteina']      += 2
        self.dados['glicemia']      += 1
        self.dados['xp']            += 7
        self._verificar_limites()

    def adicionar_carnes(self):
        self.dados['proteina']    += 3
        self.dados['xp']          += 9
        self._verificar_limites()

    def adicionar_leguminosas(self):
        self.dados['proteina']    += 2
        self.dados['carboidrato'] += 1
        self.dados['xp']          += 8
        self._verificar_limites()

    def adicionar_oleaginosas(self):
        self.dados['proteina']    += 2
        self.dados['xp']          += 7
        self._verificar_limites()

    def adicionar_doces(self):
        self.dados['glicemia']    += 4
        self.dados['carboidrato'] += 2
        self.dados['xp']          += 4
        self._verificar_limites()

    def adicionar_salgados(self):
        self.dados['carboidrato'] += 1
        self.dados['glicemia']    += 1
        self.dados['xp']          += 3
        self._verificar_limites()

    def adicionar_embutidos(self):
        self.dados['proteina']    += 1
        self.dados['glicemia']    += 2
        self.dados['xp']          += 5
        self._verificar_limites()

    def decair_status(self):
        while self.decaimento_ativo:
            time.sleep(3600)
            for chave in self.dados:
                if chave != 'xp':
                    decaimento = self.dados[chave] * 0.05
                    self.dados[chave] = max(0, self.dados[chave] - decaimento)
            self._verificar_limites()
            self._print_dados()

    def iniciar_decaimento(self):
        t = threading.Thread(target=self.decair_status, daemon=True)
        t.start()

    def parar_decaimento(self):
        self.decaimento_ativo = False