# 2020 AMC 12A Problem 17

## Problem
The vertices of a quadrilateral lie on the graph of $y=\ln{x},$ and the x-coordinates of these vertices are consecutive positive integers. The area of the quadrilateral is $\ln{\frac{91}{90}}.$ What is the x-coordinate of the leftmost vertex?

$\textbf{(A) } 6 \qquad \textbf{(B) } 7 \qquad \textbf{(C) } 10 \qquad \textbf{(D) } 12 \qquad \textbf{(E) } 13$
## Solution 1
Let the coordinates of the quadrilateral be (n,$\ln(n)),(n+1,\ln(n+1)),(n+2,\ln(n+2)),(n+3,\ln(n+3)).$ We have by shoelace's theorem, that the area is

$$
\begin{align*} &\frac{\ln(n)(n+1) + \ln(n+1)(n+2) + \ln(n+2)(n+3)+n\ln(n+3)}{2} - \frac{\ln(n+1)(n) + \ln(n+2)(n+1) + \ln(n+3)(n+2)+\ln(n)(n+3)}{2} \\ &=\frac{\ln \left( \frac{n^{n+1}(n+1)^{n+2}(n+2)^{n+3}(n+3)^n}{(n+1)^n(n+2)^{n+1}(n+3)^{n+2}n^{n+3}}\right)}{2} \\ &= \ln \left( \sqrt{\frac{(n+1)^2(n+2)^2}{n^2(n+3)^2}} \right) \\ &= \ln \left(\frac{(n+1)(n+2)}{n(n+3)}\right) \\ &= \ln \left( \frac{91}{90} \right). \end{align*}
$$

We know that the numerator must have a factor of 13, so given the answer choices, n is either 12 or 11. If $n=11$, the expression $\frac{(n+1)(n+2)}{n(n+3)}$ does not evaluate to $\frac{91}{90},$ but if $n=12$, the expression evaluates to $\frac{91}{90}.$ Hence, our answer is $\boxed{12}.$
## Solution 2
Like above, use the shoelace formula to find that the area of the quadrilateral is equal to $\ln\frac{(n+1)(n+2)}{n(n+3)}.$ Because the final area we are looking for is $\ln\frac{91}{90},$ the numerator factors into 13 and 7, which one of $n+1$ and $n+2$ has to be a multiple of 13 and the other has to be a multiple of 7. Clearly, the only choice for that is $\boxed{12}$

*~Solution by IronicNinja*
## Solution 3
How f(x)=$\ln(x)$ is a concave function, then:

[frameless|border|400px|link=https://wiki-images.artofproblemsolving.com//7/7b/Problema17NivelSuperior.png](https://artofproblemsolving.com/wiki/index.php/File:Problema17NivelSuperior.png)

Therefore [BCDE]=[ABCH]+[HCDG]+[GDEF]-[ABEF], all quadrilaterals of side right are trapezius

[BCDE]=$\frac{\ln(n+1)+\ln n}{2}+\frac{\ln(n+2)+\ln(n+1)}{2}+\frac{\ln(n+3)+\ln(n+2)}{2}-\frac{3(\ln(n+3)+\ln n)}{2}$

[BCDE]=$\tfrac{2\ln(n+1)+2\ln(n+2)-2\ln(n+3)-2\ln n}{2}=\ln(n+1)+\ln(n+2)-\ln(n+3)-\lnn=\ln\tfrac{(n+1)(n+2)}{n(n+3)}$

$$
\implies\ln\frac{(n+1)(n+2)}{n(n+3)}=\ln\frac{91}{90}\implies \frac{(n+1)(n+2)}{n(n+3)}=\frac{91}{90}
\implies n^2+3n-180=0\implies (n+15)(n-12)=0\implies n=12
$$


*~Solution by AsdrúbalBeltrán*
## Video Solution by TheBeautyofMath
https://www.youtube.com/watch?v=Eq2A2TTahqU?t=583
Another example of shoelace theorem included earlier in the video

*~IceMatrix*
## See Also
