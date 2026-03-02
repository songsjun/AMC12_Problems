# 2010 AMC 12B Problem 12

## Problem
For what value of x does


$$\log_{\sqrt{2}}\sqrt{x}+\log_{2}{x}+\log_{4}{x^2}+\log_{8}{x^3}+\log_{16}{x^4}=40?$$


$\textbf{(A)}\ 8 \qquad \textbf{(B)}\ 16 \qquad \textbf{(C)}\ 32 \qquad \textbf{(D)}\ 256 \qquad \textbf{(E)}\ 1024$
## Solution 1

$$\log_{\sqrt{2}}\sqrt{x} + \log_2x + \log_4(x^2) + \log_8(x^3) + \log_{16}(x^4) = 40$$


$$\frac{1}{2} \frac{\log_2x}{\log_2\sqrt{2}} + \log_2x + \frac{2\log_2x}{\log_24} + \frac{3\log_2x}{\log_28} + \frac{4\log_2x}{\log_216} = 40$$


$$\log_2x + \log_2x + \log_2x + \log_2x + \log_2x = 40$$

$$5\log_2x = 40$$

$$\log_2x = 8$$

 $x = 256$ \;\; (D)
## Solution 2
Using the fact that $\log_{x^n}{y^n} = \log_{x}{y},$ we see that the equation becomes $\log_{2}{x} + \log_{2}{x} + \log_{2}{x} + \log_{2}{x} + \log_{2}{x} = 40.$ Thus, $5\log_{2}{x} = 40$ and $\log_{2}{x} = 8,$ so $x = 2^8 = 256$, or $\boxed{(D)}.$
## See also
