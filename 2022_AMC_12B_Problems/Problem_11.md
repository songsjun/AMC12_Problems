# 2022 AMC 12B Problem 11

## Problem
Let  f(n) = $\left( \frac{-1+i\sqrt{3}}{2} \right)^n + \left( \frac{-1-i\sqrt{3}}{2} \right)^n$ , where $i =\sqrt{-1}.$ What is f(2022)?

$\textbf{(A)}\ -2 \qquad \textbf{(B)}\ -1 \qquad \textbf{(C)}\ 0 \qquad \textbf{(D)}\ \sqrt{3} \qquad \textbf{(E)}\ 2$
## Solution 1
Converting both summands to exponential form,

$$
\begin{align*} -1 + i\sqrt{3} &= 2e^{\frac{2\pi i}{3}}, \\ -1 - i\sqrt{3} &= 2e^{-\frac{2\pi i}{3}} = 2e^{\frac{4\pi i}{3}}. \end{align*}
$$

Notice that the two terms in the problem are two of the third roots of unity (that is, both of them equal 1 when raised to the power of 3).
When we replace the summands with their exponential form, we get f(n) = $\left(e^{\frac{2\pi i}{3}}\right)^n + \left(e^{\frac{4\pi i}{3}}\right)^n.$
When we substitute $n = 2022$, we get f(2022) = $\left(e^{\frac{2\pi i}{3}}\right)^{2022} + \left(e^{\frac{4\pi i}{3}}\right)^{2022}.$
We can rewrite 2022 as 3 $\cdot 674,$ how does that help?

$$f(2022) = \left(e^{\frac{2\pi i}{3}}\right)^{3 \cdot 674} + \left(e^{\frac{4\pi i}{3}}\right)^{3 \cdot 674} = \left(\left(e^{\frac{2\pi i}{3}}\right)^{3}\right)^{674} + \left(\left(e^{\frac{4\pi i}{3}}\right)^{3}\right)^{674} = 1^{674} + 1^{674} = \boxed{\textbf{(E)} \ 2}.$$

Since any third root of unity must cube to 1.

*~zoomanTV*
## Solution 2 (Eisenstein Units)
The numbers $\frac{-1+i\sqrt{3}}{2}$ and $\frac{-1-i\sqrt{3}}{2}$ are both $\textbf{Eisenstein Units} (a$long with 1), denoted as $\omega$ and $\omega^2,$ respectively. They have the property that when they are cubed, they equal to 1. Thus, we can immediately solve:

$$\omega^{2022} + \omega^{2 \cdot 2022} = \omega^{3 \cdot 674} + \omega^{3 \cdot 2 \cdot 674} = 1^{674} + 1^{2 \cdot 674} = \boxed{\textbf{(E)} \ 2}.$$

*~mathboy100*
## Solution 3 (Quick and Easy)
We begin by recognizing this form looks similar to the definition of cosine: $\cos(x)=\frac{e^{ix}+e^{-ix}}{2}.$ We can convert our two terms into exponential form to find f(n) = $\left(e^{\frac{2\pi i}{3}}\right ) ^n + \left (e^{-\frac{2\pi i}{3}}\right ) ^n=e^{\frac{2 \pi i n}{3}} +e^{-\frac{2\pi i n}{3}}$. This simplifies nicely: $f(n)=2\cos\left( \frac{2\pi n}{3} \right).$ Thus, f(2022)=$2\cos \left ( \frac{2\pi (2022) }{3} \right) = 2\cos(1348 \pi) = \boxed{\textbf{(E)}\ 2}.$

*~Jackson La Vallee*
## Solution 4 (Third-order Homogeneous Linear Recurrence Relation)
Notice how this looks like the closed form of the Fibonacci sequence except different roots. This is motivation to turn this closed formula into a recurrence relation. The base of the exponents are the roots of the characteristic equation $r^3-1=0$. So we have

$$
\begin{align*} a_0&=2\\ a_1&=-1\\ a_2&=-1\\ a_n&=a_{n-3} \end{align*}
$$

Every time n is multiple of 3 as is true when $n=2022, a_n=\boxed{\textbf{(E)} \ 2}$
*~lopkiloinm*
## Solution 5 (Polynomial + Recursion)
Let a = $\frac{-1+i\sqrt{3}}{2}$ and b = $\frac{-1-i\sqrt{3}}{2}.$
We know that a + b = -1 and a $\cdotb = 1$.
Therefore, a and b are the roots of $x^2 + x + 1 = 0.$
By the factor theorem, a^2 + a + 1 = 0 and $b^2 + b + 1 = 0.$
Multiply the first equation by $a^{n-2}$ and the second equation by $b^{n-2}$.
This gives us $a^n +a^{n-1}+a^{n-2} = 0$ and $b^n +b^{n-1}+b^{n-2} = 0$.
Adding both equations together we get $a^n + b^n +a^{n-1}+b^{n-1}+ a^{n-2}+b^{n-2} = 0$.
This is the same as f(n) + f$(n-1) + f(n-2) = 0$.
Therefore, $f(n) = -f(n-1) - f(n-2$).
Plugging in $n=1$,2,3,4,5, and 6, we get $f(n) = -1$, -1, 2, -1, -1, 2. Therefore we know that if n is a multiple of 3, then f(n) is 2.
Since 2022 is a multiple of 3, our answers is E) 2.
*~vpeddi18*
## Solution 6 (SO FAST)
Converting the two terms into rectangular form,


$$f(2022)=\left(\cos{\frac{2\pi}{3}}+i\sin{\frac{2\pi}{3}}\right)^{2022}+\left(\cos{\frac{4\pi}{3}}+i\sin{\frac{4\pi}{3}}\right)^{2022}.$$


By DeMoivre's Theorem,


$$f(2022)=\left(\cos{\left(\frac{2\pi}{3}\cdot{2022}\right)}+i\sin{\left(\frac{2\pi}{3}\cdot{2022}\right)}\right)+\left(\cos{\left(\frac{4\pi}{3}\cdot{2022}\right)}+i\sin{\left(\frac{4\pi}{3}\cdot{2022}\right)}\right).$$


Note that $\cos{\pi\cdot{k}}=1$ if k is even and -1 if k is odd, and that $\sin{\pi\cdot{k}}=0$ for all integers k.

All arguments are even in the second equation for f(2022), so the two $\cos$ terms are equal to 1, and the two $\sin$ terms are equal to 0.

Therefore the answer is $1+1=\boxed{\textbf{(E) } 2}.$

*~Benedict T (countmath1)*
## Solution 7 (No Euler's Identity)
Observe that ($\frac{-1+i\sqrt{3}}{2})^{2}=\frac{-1-i\sqrt{3}}{2}$ and ($\frac{-1-i\sqrt{3}}{2})^{2}=\frac{-1+i\sqrt{3}}{2}.$

It follows that ($\frac{-1+i\sqrt{3}}{2})^{4}=\frac{-1+i\sqrt{3}}{2}$ and ($\frac{-1-i\sqrt{3}}{2})^{4}=\frac{-1-i\sqrt{3}}{2}.$

The binary expansion of 2022 is $2^{10}+2^9+2^8+2^7+2^6+2^5+2^2+2^1$ which can be rewritten as $(4^5+4^4+4^3+4^1)+2(4^4+4^3+4^2+4^0)$
Thus, ($\frac{-1+i\sqrt{3}}{2})^{2022}=((\frac{-1+i\sqrt{3}}{2})^4)^4\cdot (((\frac{-1+i\sqrt{3}}{2})^4)^4)^2$ or ($\frac{-1+i\sqrt{3}}{2})(\frac{-1-i\sqrt{3}}{2})$
Similarly, ($\frac{-1-i\sqrt{3}}{2})^{2022}=(\frac{-1-i\sqrt{3}}{2})(\frac{-1+i\sqrt{3}}{2})$

$$so f(2022)=2(\frac{-1+i\sqrt{3}}{2})(\frac{-1-i\sqrt{3}}{2})=\boxed{\textbf{(E) } 2}$$


*~shibepvp*
## Video Solution by mop 2024
https://youtu.be/ezGvZgBLe8k&t=70s

*~r00tsOfUnity*
## Video Solution (Under 2 min!)
https://youtu.be/ifPUOy_uctM
*~_Education, the Study of Everything_*
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## See Also
