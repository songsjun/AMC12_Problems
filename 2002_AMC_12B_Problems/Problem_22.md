# 2002 AMC 12B Problem 22

## Problem
For all [integer](https://artofproblemsolving.com/wiki/index.php/integer)s n greater than 1, define $a_n=\frac{1}{\log_n 2002}.$ Let $b =a_2+a_3 + a_4+a_5$ and $c =a_{10}+a_{11}+a_{12}+a_{13}+a_{14}$. Then b- c equals


$$\mathrm{(A)}\ -2 \qquad\mathrm{(B)}\ -1 \qquad\mathrm{(C)}\ \frac{1}{2002} \qquad\mathrm{(D)}\ \frac{1}{1001} \qquad\mathrm{(E)}\ \frac 12$$

## Solution 1
By the [change of base](https://artofproblemsolving.com/wiki/index.php/Logarithms#Logarithmic_Properties) formula, $a_n=\frac{1}{\frac{\log 2002}{\log n}} = \left(\frac{1}{\log 2002}\right) \log$ n . Thus

$$
\begin{align*}b- c &= \left(\frac{1}{\log 2002}\right)(\log 2 + \log 3 + \log 4 + \log 5 - \log 10 - \log 11 - \log 12 - \log 13 - \log 14)\\ &= \left(\frac{1}{\log 2002}\right)\left(\log \frac{2 \cdot 3 \cdot 4 \cdot 5}{10 \cdot 11 \cdot 12 \cdot 13 \cdot 14}\right)\\ &= \left(\frac{1}{\log 2002}\right) \log 2002^{-1} = -\left(\frac{\log 2002}{\log 2002}\right) = -1 \Rightarrow \mathrm{(B)}\end{align*}
$$

## Solution 2 (basically solution 3 but with steps and a quicker conclusion)
Note that $\frac{1}{\log_a(b)} = \log_b(a)$. Therefore, $\frac{1}{\log_n(2002)} = \log_{2002}(n)$. For the sake of space and time, set $a = 2002$. Then $b$ can be represented as
$$\log_a(2) + \log_a(3) + \log_a(4) + \log_a(5)$$
 $\text{which is simply}$
$$\log_a(2 \cdot 3 \cdot 4 \cdot 5)$$
 $\text{and }$ c $\text{ can be represented as}$
$$\log_a(10) + \log_a(11) + \log_a(12) + \log_a(13) + \log_a(14)$$
 $\text{which is simply}$
$$\log_a(10 \cdot 11 \cdot 12 \cdot 13 \cdot 14)$$
 $\text{so }$ b - c $\text{ is just}$

$$\log_a(2 \cdot 3 \cdot 4 \cdot 5) - \log_a(10 \cdot 11 \cdot 12 \cdot 13 \cdot 14)$$

 $\text{which is simply}$

$$
\log_a\left(\frac{2 \cdot 3 \cdot 4 \cdot 5}{10 \cdot 11 \cdot 12 \cdot 13 \cdot 14}\right)
\text{or}
\log_a\left(\frac{1}{2002}\right)
$$

 $\text{but }$ a = 2002, $\text{ so we have}$

$$
\log_{2002}\left(\frac{1}{2002}\right)
=\boxed{\textbf{(B)}-1}
$$


*~Pinotation*
## Solution 3
Note that $\frac{1}{\log_a b}=\log_b$ a. Thus $a_n=\log_{2002}$ n. Also notice that if we have a log sum, we multiply, and if we have a log product, we divide. Using these properties, we get that the result is the following:


$$\log_{2002}\left(\frac{2*3*4*5}{10*11*12*13*14}=\frac{1}{11*13*14}=\frac{1}{2002}\right)=\boxed{\textbf{(B)}-1}$$


*~yofro*
## Solution 4
Note that $a_2=\frac{1}{\log_2 2002}. 1$ is also equal to $\log_2 2.$ So $a_2=\frac{\log_2 2}{\log_2 2002}.$ By the change of bases formula, $a_2=\log_{2002} 2.$ Following the same reasoning, $a_3=\log_{2002} 3,a_4 = \log_{2002} 4$ and so on.


$$b = \log_{2002} 2 + \log_{2002} 3 + .....+ \log_{2002} 5 = \log_{2002} 5! = \log_{2002} 120$$

Now solving for c, we see that it equals $\log_{2002} (10\cdot 11 \cdot 12 \cdot 13 \cdot 14)$

$$b-c = \log_{2002} 120 - \log_{2002} 240240 \rightarrow \log_{2002} \frac{1}{2002} = \boxed{-1}$$


*~YBSuburbanTea*
## See also
