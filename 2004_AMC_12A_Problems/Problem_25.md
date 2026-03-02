# 2004 AMC 12A Problem 25

## Problem
For each integer $n\geq 4,$ let $a_n$ denote the base-n number $0.\overline{133}_n.$ The product $a_4a_5\cdotsa_{99}$ can be expressed as $\frac$ {m}{n!}, where m and n are positive integers and n is as small as possible. What is m?


$$\text {(A)} 98 \qquad \text {(B)} 101 \qquad \text {(C)} 132\qquad \text {(D)} 798\qquad \text {(E)}962$$

## Solution
This is an infinite [geometric series](https://artofproblemsolving.com/wiki/index.php/geometric_series) with common ratio $\frac{1}{x^3}$ and initial term $x^{-1}+3x^{-2}+3x^{-3}$, so $a_x=\left(\frac{1}{x} + \frac{3}{x^2} + \frac{3}{x^3}\right)\left(\frac{1}{1-\frac{1}{x^3}}\right) = \frac{x^2 + 3x + 3}{x^3} \cdot \frac{x^3}{x^3 - 1} = \frac{x^2 + 3x + 3}{x^3 - 1} = \frac{(x+1)^3 - 1}{x(x^3 - 1)}.$

Alternatively, we could have used the algebraic manipulation for repeating decimals,


$$
\begin{align*} a_x &= \frac{1}{x}+\frac{3}{x^2}+\frac{3}{x^3}+\frac{1}{x^4}+\frac{3}{x^5}+\frac{3}{x^6}+\cdots \\ a_x \cdot x^3 &= x^2+3x+3+a_x\\ a_x(x^3-1) &= x^2+3x+3\\ a_x &= \frac{x^2+3x+3}{x^3-1}=\frac{(x+1)^3-1}{x(x^3-1)} \end{align*}
$$


[Telescoping](https://artofproblemsolving.com/wiki/index.php/Telescoping),


$$
\begin{align*} a_4a_5\cdots a_{99}&= \frac{(5^3-1)(6^3-1)\cdots (100^3-1)}{4 \cdot 5 \cdot 6 \cdot \cdots \cdot 99 \cdot (4^3-1)(5^3-1)\cdots(99^3-1)}\\ a_4a_5\cdots a_{99}&= \frac{999999}{4 \cdot 5 \cdot 6 \cdot \cdots \cdot 99 \cdot 63}=\frac{13 \cdot 37 \cdot 33 \cdot 6}{99!}\end{align*}
$$


Some factors cancel, (after all, 13 $\cdot 37 \cdot 33 \cdot 6$ isn't one of the answer choices)

$$\frac{13 \cdot 37 \cdot 33 \cdot 6}{99!}=\frac{13 \cdot 37 \cdot 2}{98!}$$

Since the only factor in the numerator that goes into 98 is 2, n is minimized. Therefore the answer is 13 $\cdot 37 \cdot 2=962 \Rightarrow \text$ {(E)}.
## Solution 2
Note that$0.\overline{133}_n = \frac{n^2+3n+3}{n^3-1},b$y geometric series.
Thus, we're aiming to find the value of$\prod_{k=4}^{99} \frac{k^2+3k+3}{k^3 - 1}.$Expanding the product out, this is equivalent to
$\frac{4^2+3(4)+3}{4^3 - 1} \cdot \frac{5^2+3(5)+3}{5^3 - 1} \cdot \frac{6^2+3(6)+3}{6^3 - 1} \cdot$ ... $\cdot \frac{99^2+3(99)+3}{99^3 - 1}.$Note that the numerator of the ath fraction and the denominator of the a+1th fraction for 1 $\leq$ a $\leq 95$ cancel out to be $\frac{1}{a+3},$ since$\frac{k^2 + 3k + 3}{(k+1)^3 - 1} = \frac{k^2 + 3k + 3}{k^3 + 3k^2 + 3k} = \frac{1}{k},b$y the binomial theorem on the the denominator of the aforementioned. Since this forms a telescoping series, our product is now equivalent to$\frac{99^2 + 3(99) + 3}{4^3 - 1} \cdot \prod_{k=4}^{98} \frac{1}{k},$ which, after simplification gives $\frac{6}{98!} \cdot \frac{10101}{63} = \frac{962}{98!},$ giving an answer of $\boxed{962}.$

*~fidgetboss_4000*
## See Also
