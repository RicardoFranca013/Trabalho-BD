// Script simples para alternar entre as abas do Painel Administrativo
document.querySelectorAll('.sidebar nav ul li a').forEach(link => {
    link.addEventListener('click', function(e) {
        document.querySelectorAll('.sidebar nav ul li a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});