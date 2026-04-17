namespace Pascholotto.Infrastructure.Services;

internal interface IBoletoPdfGenerator
{
    byte[] Generate(BoletoPdfModel model);
}
