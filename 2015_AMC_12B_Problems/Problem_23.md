# 2015 AMC 12B Problem 23

> This problem is the same as [2015 AMC 10B #25](https://artofproblemsolving.com/wiki/index.php/2015_AMC_10B_Problems#Problem_25) and [2015 AMC 12B #23](https://artofproblemsolving.com/wiki/index.php/2015_AMC_12B_Problems#Problem_23).
## Problem
A rectangular box measures a $\times$ b $\times$ c, where a, b, and c are integers and $1\leq$ a $\leq$ b $\leq$ c. The volume and the surface area of the box are numerically equal. How many ordered triples (a,b,c) are possible?

$\textbf{(A)}\; 4 \qquad\textbf{(B)}\; 10 \qquad\textbf{(C)}\; 12 \qquad\textbf{(D)}\; 21 \qquad\textbf{(E)}\; 26$
## Solution 1
We need $abc =2(ab+bc+ac)\quad \text{ or } \quad (a-2)$bc = $2a(b+c)$.
Since $a\le$ b and a,b,c are all positive,ac $\le$ bc. From the first equation we get abc $\le 6$bc. Thus $a\le 6.$ From the second equation we see that a > 2. Thus $a\in\{3, 4, 5, 6\}$. For the following we need the resulting (b,c) to be positive integers and b and c to satisfy the condition $1\leq$ a $\leq$ b $\leq$ c.

*If $a=3$ we need $bc =6(b+c)\Rightarrow (b-6)(c-6)=36.$ We get **five** roots $\{(3, 7, 42), (3, 8, 24), (3,9,18), (3, 10, 15), (3,12,12)\}$.

*If $a=4$ we need $2bc =8(b+c)\Rightarrowbc =4(b+c)\Rightarrow (b-4)(c-4)=16.$ We get **three** roots $\{(4,5,20), (4,6,12), (4,8,8)\}$.

*If $a=5$ we need $3bc =10(b+c)\Rightarrow 9bc=30(b+c)\Rightarrow (3b-10)(3c-10)=100.$ We get **one** root $\{(5,5,10)\}$.

*If $a=6$ we need $4bc =12(b+c)\Rightarrowbc =3(b+c)\Rightarrow (b-3)(c-3)=9.$ We get ** one** root $\{(6,6,6)\}$.

Thus, there are 5+3+1+1 = $\boxed{\textbf{(B)}\; 10}$ solutions.
### Supplement
Another method for finding the upper bound of  a  is to multiply $abc =2(ab+bc+ac)$ by three, allowing us to factor the expression into  ab$(c-6) + bc(a-6)$ + ca(b-6)$$ = 0. When  a > 6 , all terms are clearly greater than 0, as a, b , c must be positive. Therefore, we arrive at a contradiction, and  a $\leq 6$ .
## Solution 2
The surface area is $2(ab+bc+ca)$, and the volume is abc, so equating the two yields

$2(ab+bc+ca)$=abc.

Divide both sides by 2abc to obtain $\frac{1}{a}+\frac{1}{b}+\frac{1}{c}=\frac{1}{2}.$

First consider the bound of the variable a. Since $\frac{1}{a}<\frac{1}{a}+\frac{1}{b}+\frac{1}{c}=\frac{1}{2},$ we have a>2, or a\geqslant3.

Also note that c $\geq$ b $\geq$ a > 0, hence $\frac{1}{a} \geq \frac{1}{b} \geq \frac{1}{c}.$
Thus, $\frac{1}{2}=\frac{1}{a}+\frac{1}{b}+\frac{1}{c} \leq \frac{3}{a},$ so a $\leq 6.$

So we have $a=3$, 4, 5 or 6.

Before the casework, let's consider the possible range for b if $\frac{1}{b}+\frac{1}{c}=k>0.$ From $\frac{1}{b},$ we have b>$\frac{1}{k}.$ From $\frac{2}{b} \geq \frac{1}{b}+\frac{1}{c}=k,$ we have b $\leq \frac{2}{k}.$ Thus $\frac{1}{k}$**. When $a=3$, we get $\frac{1}{b}+\frac{1}{c}=\frac{1}{6},$ so $b=7$, 8, 9, 10, 11, 12. We find the solutions (a, b, c)=(3, 7, 42), (3, 8, 24), (3, 9, 18), (3, 10, 15), (3, 12, 12), for a total of 5 solutions. When $a=4$, we get $\frac{1}{b}+\frac{1}{c}=\frac{1}{4},$ so $b=5$, 6, 7, 8. We find the solutions (a, b, c)=(4, 5, 20), (4, 6, 12), (4, 8, 8), for a total of 3 solutions. When $a=5$, we get $\frac{1}{b}+\frac{1}{c}=\frac{3}{10},$ so $b=5$, 6. The only solution in this case is (a, b, c)=(5, 5, 10). When $a=6$, b is forced to be 6, and thus (a, b, c)=(6, 6, 6). Thus, there are $5+3+1+1 =\boxed{\textbf{(B)}\; 10}$ solutions.
## Simplification of Solution 2
The surface area is $2(ab+bc+ca)$, the volume is abc, so $2(ab+bc+ca)$=abc. Divide both sides by 2abc, we have: $\frac{1}{a}+\frac{1}{b}+\frac{1}{c}=\frac{1}{2}.$ First consider the bound of the variable a. Since $\frac{1}{a}<\frac{1}{a}+\frac{1}{b}+\frac{1}{c}=\frac{1}{2},$ we have a>2, or $a\ge 3.$ Also note that $c\geb\ge$ a>0, we have $\frac{1}{a}\ge \frac{1}{b}\ge \frac{1}{c}.$ Thus, $\frac{1}{2}=\frac{1}{a}+\frac{1}{b}+\frac{1}{c}\le \frac{3}{a},$ so $a\le 6.$ So we have $a=3$, 4, 5 or 6. We can say $\frac{1}{b}+\frac{1}{c}=\frac{1}{q},$ where $\frac{1}{q} = \frac{1}{2}-\frac{1}{a}.$ Notice $\emph{\text{immediately}}$ that b, c > q. This is our key step. Then we can say b=q+d, c=q+e. If we clear the fraction about b and c (do the math), our immediate result is that de = q^2. Realize also that d $\leq$ e. Now go through cases for a and you end up with the same result. However, now you don't have to guess solutions. For example, when $a=3$, then de = 36 and $d=1$, 2, 3, 4, 6.
## Video Solution
https://www.youtube.com/watch?v=JFUpe32aWnw&t=1941s
