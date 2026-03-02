# 2021 AMC 12A Problem 9

> This problem is the same as [2021 AMC 10A #10](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_10) and [2021 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_9).
## Problem
Which of the following is equivalent to
$$(2+3)(2^2+3^2)(2^4+3^4)(2^8+3^8)(2^{16}+3^{16})(2^{32}+3^{32})(2^{64}+3^{64})?$$
$\textbf{(A)} ~3^{127} + 2^{127} \qquad\textbf{(B)} ~3^{127} + 2^{127} + 2 \cdot 3^{63} + 3 \cdot 2^{63} \qquad\textbf{(C)} ~3^{128}-2^{128} \qquad\textbf{(D)} ~3^{128} + 2^{128} \qquad\textbf{(E)} ~5^{127}$
## Solution 1
By multiplying the entire equation by $3-2=1$, all the terms will simplify by difference of squares, and the final answer is $\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

Additionally, we could also multiply the entire equation (we can let it be equal to x) by 2-3=-1. The terms again simplify by difference of squares. This time, we get -$x=2^{128}-3^{128}\Rightarrowx=3^{128}-2^{128}$. Both solutions yield the same answer.

Note: Also notice when you multiply it by the first pair (2+3), it immediately factors. Notice how it "domino" effects to the others, ultimately collapsing into $\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

*~BakedPotato66*
*~Note by hashbrown2009*
## Solution 2
If you weren't able to come up with the (3 - 2) insight, then you could just notice that the answer is divisible by
$2 + 3 = 5$, and $2^2 + 3^2 = 13.$ We can then use Fermat's Little Theorem for $p = 5$, 13 on the answer choices to determine which of the answer choices are divisible by both 5 and 13. This is $\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

*~mewto*
## Solution 3 (Units Digit and Multiples)
Notice that simplifying the first term gives 5, which means that the units digit of the entire expression must be 5. Also, note how the numbers appear to form multiples of 2, so therefore our answer should contain a power of 2. The only one that satisfies the above properties is $\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

*~Pinotation*
## Solution 4
After expanding the first few terms, the result after each term appears to be $2^{2^n-1}+2^{2^n-2}\cdot{3^1} + 2^{2^n-3}\cdot{3^2} + \cdots + 2^1\cdot{3^{2^n-2}} + 3^{2^n-1}$ where n is the number of terms expanded. We can prove this using mathematical induction. The base step is trivial. When expanding another term, all of the previous terms multiplied by $2^{2^{n-1}}$ would give $2^{2^n-1}+2^{2^n-2}\cdot{3^1} + 2^{2^n-3}\cdot{3^2} + \cdots + 2^{2^{n-1}+1}\cdot{3^{2^{n-1}-1}} + 2^{2^{n-1}}\cdot{3^{2^{n-1}}},$ and all the previous terms multiplied by $3^{2^{n-1}}$ would give $3^{2^n-1}+3^{2^n-2}\cdot{2^1} + 3^{2^n-3}\cdot{2^2} + \cdots + 3^{2^{n-1}+1}\cdot{2^{2^{n-1}-1}} + 3^{2^{n-1}}\cdot{2^{2^{n-1}}}.$ Their sum is equal to $2^{2^n-1}+2^{2^n-2}\cdot{3^1} + 2^{2^n-3}\cdot{3^2} + \cdots + 2^1\cdot{3^{2^n-2}} + 3^{2^n-1},$ so the proof is complete. Since $\frac{3^{2^n}-2^{2^n}}{3-2}$ is equal to $2^{2^n-1}+2^{2^n-2}\cdot{3^1} + 2^{2^n-3}\cdot{3^2} + \cdots + 2^1\cdot{3^{2^n-2}} + 3^{2^n-1},$ the answer is $\frac{3^{2^7}-2^{2^7}}{3-2}=\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

*~SmileKat32*
## Solution 5 (Engineer's Induction)
We can compute some of the first few partial products, and notice that $\prod_{k = 0}^{2^n} (2^{2^n}+3^{2^n}) = 3^{2^{n+1}} - 2^{2^{n+1}}.$ As we don't have to prove this, we get the product is $3^{2^7}-2^{2^7}=3^{128}-2^{128}$, and click $\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

*~rocketsri*
## Solution 6 (Difference of Squares)
We notice that the first term is equal $to 3^2 - 2^2.$ If we multiply this by the second term, then we will get $(3^2 - 2^2)(3^2 + 2^2),$ and we can simplify by using difference of squares to obtain $3^4 - 2^4.$ If we multiply this by the third term and simplify using difference of squares again, we get $3^8 - 2^8.$ We can continue down the line until we multiply by the last term, $3^{64}+2^{64}$, and get $\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

*~mathboy100*
## Solution 7 (Generalization)
Let’s generalize to $x=3$ and $y=2$. Then we get:
$$(y+x)(y^2+x^2)(y^4+x^4)(y^8+x^8)(y^{16}+x^{16})(y^{32}+x^{32})(y^{64}+x^{64}).$$
We see that the first term is y+x, and the next is $y^2+x^2.$ We realize that if we multiply the first term by y-x, the result by difference of squares will be $y^2-x^2$: we can proceed to use difference of squares on that. In other words, the equation has the domino effect, and all we need to get started is to multiply the whole equation by y-x (keeping in mind to divide y-x at the end.)

Now we get:

$$
\begin{align*} &\hspace{5.125mm}(y-x)(y+x)(y^2+x^2)(y^4+x^4)(y^8+x^8)(y^{16}+x^{16})(y^{32}+x^{32})(y^{64}+x^{64}) \\ &=(y^2-x^2)(y^2+x^2)(y^4+x^4)(y^8+x^8)(y^{16}+x^{16})(y^{32}+x^{32})(y^{64}+x^{64}) \\ &=(y^4-x^4)(y^4+x^4)(y^8+x^8)(y^{16}+x^{16})(y^{32}+x^{32})(y^{64}+x^{64}) \\ & \ \vdots \\ &=(y^{64}-x^{64})(y^{64}+x^{64}) \\ &=y^{128}-x^{128}. \end{align*}
$$

Now we can plug in $y = 2$ and $x = $3: (2-3)(2+3)(2^2+3^2)(2^4+3^4)(2^8+3^8)(2^{16}+3^{16})(2^{32}+3^{32})(2^{64}+3^{64})= $2^{128}-3^{128}$.
However, we must not forget to divide by 2-3 = -1 at the end! Dividing, we get the answer of
$$3^{128}-2^{128} = \boxed{\textbf{(C)} ~3^{128}-2^{128}}.$$
*~KingRavi*
## Solution 8 (Generalization)
More generally, we have $\bigl(a^n-b^n\bigr)\bigl(a^n+b^n\bigr)=a^{2n}-b^{2n}\hspace{20mm}($\bigstar) by the difference of squares.

Multiplying the original expression by 1=3-2 and then applying (\bigstar) repeatedly, we get

$$
\begin{align*} &\hspace{5.125mm}\bigl(2+3\bigr)\bigl(2^2+3^2\bigr)\bigl(2^4+3^4\bigr)\bigl(2^8+3^8\bigr)\bigl(2^{16}+3^{16}\bigr)\bigl(2^{32}+3^{32}\bigr)\bigl(2^{64}+3^{64}\bigr) \\ &=\underbrace{\bigl(\hspace{3.25mm}1\hspace{3.25mm}\bigr)}_{3-2}\underbrace{\bigl(2+3\bigr)\bigl(2^2+3^2\bigr)\bigl(2^4+3^4\bigr)\bigl(2^8+3^8\bigr)\bigl(2^{16}+3^{16}\bigr)\bigl(2^{32}+3^{32}\bigr)\bigl(2^{64}+3^{64}\bigr)}_{\text{Apply the }\textbf{Commutative Property of Addition}\text{ to all factors.}} \\ &=\underbrace{\bigl(3-2\bigr)\bigl(3+2\bigr)}_{\substack{\text{Apply }(\bigstar) \\ \text{to get }3^2-2^2.}}\bigl(3^2+2^2\bigr)\bigl(3^4+2^4\bigr)\bigl(3^8+2^8\bigr)\bigl(3^{16}+2^{16}\bigr)\bigl(3^{32}+2^{32}\bigr)\bigl(3^{64}+2^{64}\bigr) \\ &=\underbrace{\bigl(3^2-2^2\bigr)\bigl(3^2+2^2\bigr)}_{\substack{\text{Apply }(\bigstar) \\ \text{to get }3^4-2^4.}}\bigl(3^4+2^4\bigr)\bigl(3^8+2^8\bigr)\bigl(3^{16}+2^{16}\bigr)\bigl(3^{32}+2^{32}\bigr)\bigl(3^{64}+2^{64}\bigr) \\ &=\underbrace{\bigl(3^4-2^4\bigr)\bigl(3^4+2^4\bigr)}_{\substack{\text{Apply }(\bigstar) \\ \text{to get }3^8-2^8.}}\bigl(3^8+2^8\bigr)\bigl(3^{16}+2^{16}\bigr)\bigl(3^{32}+2^{32}\bigr)\bigl(3^{64}+2^{64}\bigr) \\ & \ \vdots \\ &=\boxed{\textbf{(C)} ~3^{128}-2^{128}}. \end{align*}
$$

*~MRENTHUSIASM*
## Solution 9 (Desperate & Cheese, Similar to Solution 5)
One would probably assume that the factorization that this is equal to can be generalized for the pattern $(2+3)(2^2 + 3^2)(2^4+3^4)\cdots(2^n + 3^n).$
So we can take a smaller portion and apply the answer choices there. We get
$$(2+3)(2^2 + 3^2) = (5)(13) = 65.$$
We notice that the patterns have a relationship where its either the sum of the powers or the next power not included that is incorporated. So we change the numbers from 127 to 3, 128 to 4, and 63 to 1 (since 63 is the sum of the powers, divided by 2, rounded down). Checking the values of the other patterns, the only one that gives 65 is $3^4 - 2^4,$ which means the answer is $\boxed{\textbf{(C)} ~3^{128}-2^{128}}.$

*~neeyakkid23*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/Pm3euI3jyDk

*~Education the Study of Everything*
## Video Solution by Aaron He
https://www.youtube.com/watch?v=xTGDKBthWsw&t=9m30s
## Video Solution (Conjugation, Difference of Squares)
https://www.youtube.com/watch?v=gXaIyeMF7Qo&list=PLexHyfQ8DMuKqltG3cHT7Di4jhVl6L4YJ&index=9
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=P5al76DxyHY
## Video Solution by OmegaLearn (Factorizations/Telescoping & Meta-solving)
https://youtu.be/H34IFMlq7Lk

*~pi_is_3.14*
## Video Solution by WhyMath
https://youtu.be/-MJXKZowfO0

*~savannahsolver*
## Video Solution by TheBeautyofMath
https://youtu.be/s6E4E06XhPU?t=771 (for AMC 10A)

https://youtu.be/cckGBU2x1zg?t=548 (for AMC 12A)

*~IceMatrix*
## Video Solution by The Learning Royal
https://youtu.be/AWjOeBFyeb4
## See also
