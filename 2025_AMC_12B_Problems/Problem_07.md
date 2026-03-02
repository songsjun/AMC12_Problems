# 2025 AMC 12B Problem 7

## Problem
What is the value of $\sum_{n = 2}^{255}\frac{\log_{2}\left(1 + \tfrac{1}{n}\right)}{\left(\log_{2}n\right)\left(\log_{2}(n + 1)\right)}$?
$\textbf{(A)}~\frac{3}{4} \qquad \textbf{(B)}~1 -\frac{1}{\log_{2}255} \qquad \textbf{(C)}~\frac{7}{8} \qquad \textbf{(D)}~\frac{15}{16} \qquad \textbf{(E)}~1$
## Solution
By logarithm rules, write

$$
\begin{align}
\sum_{n = 2}^{255}\frac{\log_{2}\left(1 + \tfrac{1}{n}\right)}{\left(\log_{2}n\right)\left(\log_{2}(n + 1)\right)}&=
\sum_{n = 2}^{255}\frac{\log_{2}\left(\tfrac{n+1}{n}\right)}{\left(\log_{2}n\right)\left(\log_{2}(n + 1)\right)}\\
&=\sum_{n = 2}^{255}\frac{\log_{2}(n+1)-\log_{2}n}{\left(\log_{2}n\right)\left(\log_{2}(n + 1)\right)}\\
&=\sum_{n = 2}^{255}\left(\frac{1}{\log_{2}n}-\frac{1}{\log_{2}(n+1)}\right)\\
\end{align}
$$


But this telescopes to $\frac{1}{\log_{2}2}-\frac{1}{\log_{2}256}=\frac{1}{1}-\frac{1}{8}=\boxed{\textbf{(C)}~\frac{7}{8}}.$

~ [https://artofproblemsolving.com/wiki/index.php/User:Eevee9406 eevee9406]
## See Also
